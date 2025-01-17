from http import HTTPStatus

from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.test.client import RequestFactory
from django.urls import reverse

from euphro_auth.models import User

from ...admin.project import BeamTimeRequestInline, ParticipationInline, ProjectAdmin
from ...models import Institution, Participation, Project


def get_existing_particiation_post_data(index: int, participation: Participation):
    return {
        f"participation_set-{index}-user": participation.user_id,
        f"participation_set-{index}-project": participation.project_id,
        f"participation_set-{index}-id": participation.id,
        f"participation_set-{index}-is_leader": participation.is_leader,
        f"participation_set-{index}-institution": participation.institution_id,
    }


def get_add_participation_post_data(
    index: int, project: Project, user: User, is_leader: bool, institution: Institution
):
    return {
        f"participation_set-{index}-user": user.id,
        f"participation_set-{index}-project": project.id,
        f"participation_set-{index}-id": "",
        f"participation_set-{index}-is_leader": is_leader,
        f"participation_set-{index}-institution": institution.id,
    }


def get_empty_beam_time_request_post_data(project_id: int):
    return {
        "beamtimerequest-TOTAL_FORMS": "1",
        "beamtimerequest-INITIAL_FORMS": "0",
        "beamtimerequest-0-request_type": "",
        "beamtimerequest-0-request_id": "",
        "beamtimerequest-0-form_type": "",
        "beamtimerequest-0-problem_statement": "",
        "beamtimerequest-0-id": "",
        "beamtimerequest-0-project": project_id,
    }


class BaseTestCases:
    class BaseTestProjectAdmin(TestCase):
        def setUp(self):
            self.client = Client()
            self.add_view_url = reverse("admin:lab_project_add")
            self.request_factory = RequestFactory()

            self.admin_user = get_user_model().objects.create_user(
                email="admin_user@test.com",
                password="admin_user",
                is_staff=True,
                is_lab_admin=True,
            )

            self.base_institution = Institution.objects.create(
                name="Louvre", country="France"
            )


class TestProjectAdminViewAsAdminUser(BaseTestCases.BaseTestProjectAdmin):
    def setUp(self):
        super().setUp()

        self.project_participant_user = get_user_model().objects.create_user(
            email="project_participant_user@test.com",
            password="project_participant_user",
            is_staff=True,
        )
        self.client.force_login(self.admin_user)

    def test_add_project_form_has_leader_hidden_input(self):
        response = self.client.get(self.add_view_url)
        assert response.status_code == HTTPStatus.OK
        assert (
            '<input type="hidden" name="participation_set-0-is_leader" '
            'value="True" id="id_participation_set-0-is_leader">'
            in response.content.decode()
        )

    def test_add_project_allows_setting_any_user_as_leader(self):
        response = self.client.post(
            self.add_view_url,
            data={
                "name": "some project name",
                "participation_set-TOTAL_FORMS": "1",
                "participation_set-INITIAL_FORMS": "0",
                "participation_set-0-id": "",
                "participation_set-0-project": "",
                "participation_set-0-user": self.project_participant_user.id,
                "participation_set-0-is_leader": "True",
                "participation_set-0-institution": self.base_institution.id,
            },
        )
        assert response.status_code == 302
        assert Project.objects.all().count() == 1
        assert Project.objects.all()[0].name == "some project name"
        assert (
            Project.objects.all()[0].leader.user_id == self.project_participant_user.id
        )

    def test_add_project_set_admin_as_admin(self):
        project = Project.objects.create(name="some project name")
        change_view_url = reverse("admin:lab_project_change", args=[project.id])
        request = self.request_factory.get(change_view_url)
        request.user = self.admin_user
        admin = ProjectAdmin(Project, admin_site=AdminSite())
        admin_form = admin.get_form(request, project, change=False)
        admin.save_model(request, project, admin_form, change=False)
        assert project.admin == self.admin_user

    def test_can_view_all_projects(self):
        Project.objects.create(name="other project 1")
        Project.objects.create(name="other project 2")
        response = self.client.get(reverse("admin:lab_project_changelist"))
        assert response.status_code == 200
        assert "other project 1" in response.content.decode()
        assert "other project 2" in response.content.decode()

    def test_participation_inline_is_present_in_changeview(self):
        project = Project.objects.create(name="some project name")
        change_view_url = reverse("admin:lab_project_change", args=[project.id])
        request = self.request_factory.get(change_view_url)
        request.user = self.admin_user
        inlines = ProjectAdmin(Project, admin_site=AdminSite()).get_inlines(
            request, project
        )
        assert ParticipationInline in inlines

    def test_get_content_has_change_leader_link(self):
        project = Project.objects.create(name="some project name")
        project.participation_set.create(
            user=self.project_participant_user,
            is_leader=True,
            institution=self.base_institution,
        )
        change_view_url = reverse("admin:lab_project_change", args=[project.id])
        response = self.client.get(change_view_url)

        assert "change-leader-link" in response.content.decode()


class TestProjectAdminViewAsProjectLeader(BaseTestCases.BaseTestProjectAdmin):
    def setUp(self):
        super().setUp()
        self.project_leader = get_user_model().objects.create_user(
            email="leader@test.com",
            password="leader",
            is_staff=True,
        )
        self.project = Project.objects.create(name="some project name")
        self.leader_participation = self.project.participation_set.create(
            user=self.project_leader, is_leader=True, institution=self.base_institution
        )
        self.client.force_login(self.project_leader)
        self.change_view_url = reverse(
            "admin:lab_project_change", args=[self.project.id]
        )

    def test_participation_inline_is_present_in_changeview(self):
        request = self.request_factory.get(self.change_view_url)
        request.user = self.project_leader
        inlines = ProjectAdmin(Project, admin_site=AdminSite()).get_inlines(
            request, self.project
        )
        assert ParticipationInline in inlines

    def test_change_leader_link_is_hidden(self):
        response = self.client.get(self.change_view_url)

        assert "change-leader-link" not in response.content.decode()


class TestProjectAdminViewAsProjectMember(BaseTestCases.BaseTestProjectAdmin):
    def setUp(self):
        super().setUp()

        self.project_member = get_user_model().objects.create_user(
            email="project_participant_user@test.com",
            password="project_participant_user",
            is_staff=True,
        )
        self.projects_with_member = [
            Project.objects.create(name="project foo"),
            Project.objects.create(name="project bar"),
        ]
        for project in self.projects_with_member:
            project.participation_set.create(user=self.admin_user, is_leader=True)
            project.participation_set.create(user=self.project_member)
        self.client.force_login(self.project_member)

    def test_cannot_view_other_projects(self):
        project = Project.objects.create(name="unviewable")
        project.participation_set.create(user=self.admin_user, is_leader=True)
        response = self.client.get(reverse("admin:lab_project_changelist"))
        assert response.status_code == 200
        assert "unviewable" not in response.content.decode()

    def test_add_project_form_has_no_leader_dropdown(self):
        response = self.client.get(self.add_view_url)
        assert response.status_code == HTTPStatus.OK
        assert (
            '<select name="leader" required id="id_leader">'
            not in response.content.decode()
        )

    def test_add_project_sets_user_as_leader(self):
        response = self.client.post(
            self.add_view_url,
            data={
                "name": "some project name",
            },
        )
        project = Project.objects.get(name="some project name")

        assert response.status_code == 302
        assert project.name == "some project name"
        assert project.leader.user_id == self.project_member.id

    def test_add_project_adds_user_as_member(self):
        response = self.client.post(
            self.add_view_url,
            data={
                "name": "some project name",
            },
        )
        assert response.status_code == 302
        project = Project.objects.get(name="some project name")
        assert project.members.count() == 1
        assert project.members.all()[0].id == self.project_member.id

    def test_participation_inline_is_absent_in_changeview(self):
        project = self.projects_with_member[0]
        change_view_url = reverse("admin:lab_project_change", args=[project.id])
        request = self.request_factory.get(change_view_url)
        request.user = self.project_member
        inlines = ProjectAdmin(Project, admin_site=AdminSite()).get_inlines(
            request, project
        )
        assert ParticipationInline not in inlines

    def test_beamtimerequest_inline_is_present_in_changeview(self):
        project = self.projects_with_member[0]
        change_view_url = reverse("admin:lab_project_change", args=[project.id])
        request = self.request_factory.get(change_view_url)
        request.user = self.project_member
        inlines = ProjectAdmin(Project, admin_site=AdminSite()).get_inlines(
            request, project
        )
        assert BeamTimeRequestInline in inlines

import json

from django.contrib.admin.sites import AdminSite
from django.test import TestCase
from django.test.client import RequestFactory
from django.urls import reverse

from lab.forms import ObjectGroupForm
from lab.models.run import ObjectGroup

from ...admin import ObjectGroupAdmin
from .. import factories


class TesObjectGroupAdminPermissions(TestCase):
    def setUp(self):
        self.objectgroup_admin = ObjectGroupAdmin(
            model=ObjectGroup, admin_site=AdminSite()
        )
        self.run = factories.RunFactory(project=factories.ProjectWithLeaderFactory())
        self.member = self.run.project.members.first()
        self.object_group = factories.ObjectGroupFactory()
        self.object_group.runs.add(self.run)

    def test_change_objectgroup_is_allowed_if_project_member(self):
        request = RequestFactory().get(
            reverse("admin:lab_objectgroup_change", args=[self.object_group.id])
        )
        request.user = self.member
        assert self.objectgroup_admin.has_change_permission(request, self.object_group)

    def test_change_objectgroup_is_forbidden_for_non_participant(self):
        user = factories.StaffUserFactory()
        request = RequestFactory().get(
            reverse("admin:lab_objectgroup_change", args=[self.object_group.id])
        )
        request.user = user
        assert not self.objectgroup_admin.has_change_permission(
            request, self.object_group
        )


class TestObjectGroupAdminBehavior(TestCase):
    def setUp(self):
        self.objectgroup_admin = ObjectGroupAdmin(
            model=ObjectGroup, admin_site=AdminSite()
        )
        self.run = factories.RunFactory(project=factories.ProjectWithLeaderFactory())
        self.member = self.run.project.members.first()
        self.object_group = factories.ObjectGroupFactory()

    def test_save_run_relationship_when_specified_in_popup_when_adding(self):
        request = RequestFactory().post(
            reverse("admin:lab_objectgroup_add") + f"?run={self.run.id}", {"_popup": 1}
        )
        request.user = self.member
        self.objectgroup_admin.save_model(
            request, self.object_group, ObjectGroupForm(), change=False
        )
        self.object_group.refresh_from_db()

        assert self.object_group.runs.filter(id=self.run.id).exists()

    def test_saving_run_relationship_is_ignored_when_run_does_not_exist(self):
        request = RequestFactory().post(
            reverse("admin:lab_objectgroup_add") + "?run=-23", {"_popup": 1}
        )
        request.user = self.member
        self.objectgroup_admin.save_model(
            request, self.object_group, ObjectGroupForm(), change=False
        )
        self.object_group.refresh_from_db()

        assert not self.object_group.runs.exists()

    def test_saving_run_relationship_is_ignored_on_change(self):
        request = RequestFactory().post(
            reverse("admin:lab_objectgroup_change", args=[self.object_group.id])
            + f"?run={self.run.id}",
            {"_popup": 1},
        )
        request.user = self.member
        self.objectgroup_admin.save_model(
            request, self.object_group, ObjectGroupForm(), change=True
        )
        self.object_group.refresh_from_db()

        assert not self.object_group.runs.exists()

    def test_saving_run_relationship_is_ignored_when_not_popup(self):
        request = RequestFactory().post(
            reverse("admin:lab_objectgroup_add") + f"?run={self.run.id}",
        )
        request.user = self.member
        self.objectgroup_admin.save_model(
            request, self.object_group, ObjectGroupForm(), change=True
        )
        self.object_group.refresh_from_db()

        assert not self.object_group.runs.exists()

    def test_response_add_add_context_in_popup_post(self):
        run = factories.RunFactory(project=factories.ProjectWithLeaderFactory())
        self.object_group.runs.add(run)
        request = RequestFactory().post(
            reverse("admin:lab_objectgroup_add") + f"?run={self.run.id}",
            {"_popup": 1},
        )
        request.user = self.member
        response = self.objectgroup_admin.response_add(request, self.object_group)

        popup_response_data = json.loads(response.context_data["popup_response_data"])
        assert "objectgroup_run_run_ids" in popup_response_data
        assert popup_response_data["objectgroup_run_run_ids"] == [
            [self.object_group.runs.through.objects.get(run=run.id).id, run.id],
        ]

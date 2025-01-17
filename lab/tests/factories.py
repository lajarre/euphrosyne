from datetime import datetime, timedelta, timezone

import factory
import factory.fuzzy
from django.contrib.auth import get_user_model

from lab.models.run import Object, ObjectGroup

from ..models import Participation, Project, Run

NOW = datetime.now(tz=timezone.utc)


class StaffUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()

    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    email = factory.LazyAttribute(
        lambda u: "{}.{}@example.com".format(u.first_name, u.last_name).lower()
    )
    password = factory.Faker("password")
    is_staff = True


class LabAdminUserFactory(StaffUserFactory):
    is_lab_admin = True


class ParticipationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Participation

    user = factory.SubFactory(StaffUserFactory)
    project = factory.SubFactory("lab.tests.factories.ProjectFactory")


class ProjectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Project

    name = factory.Faker("name")


class ProjectWithLeaderFactory(ProjectFactory):
    leader_participation = factory.RelatedFactory(
        ParticipationFactory, factory_related_name="project", is_leader=True
    )


class ProjectWithMultipleParticipationsFactory(ProjectWithLeaderFactory):
    member_1 = factory.RelatedFactory(
        ParticipationFactory, factory_related_name="project", is_leader=False
    )
    member_2 = factory.RelatedFactory(
        ParticipationFactory, factory_related_name="project", is_leader=False
    )
    member_3 = factory.RelatedFactory(
        ParticipationFactory, factory_related_name="project", is_leader=False
    )
    member_4 = factory.RelatedFactory(
        ParticipationFactory, factory_related_name="project", is_leader=False
    )


class RunFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Run

    label = factory.Faker("name")
    project = factory.SubFactory(ProjectFactory)
    energy_in_keV = factory.fuzzy.FuzzyInteger(0, high=10000, step=500)
    particle_type = factory.fuzzy.FuzzyChoice(Run.ParticleType)
    start_date = factory.fuzzy.FuzzyDateTime(
        start_dt=NOW, end_dt=NOW + timedelta(days=1)
    )
    end_date = factory.fuzzy.FuzzyDateTime(
        start_dt=NOW + timedelta(days=7), end_dt=NOW + timedelta(days=8)
    )
    embargo_date = factory.fuzzy.FuzzyDate(
        start_date=NOW.date() + timedelta(days=15),
        end_date=NOW.date() + timedelta(days=21),
    )
    beamline = "Microbeam"


class RunForceNoMethodFactory(RunFactory):
    @classmethod
    def _adjust_kwargs(cls, **kwargs):
        method_fieldnames = [f.name for f in Run.get_method_fields()]
        return {
            fieldname: value
            for fieldname, value in kwargs.items()
            if fieldname not in method_fieldnames
        }


class RunReadyToAskExecFactory(RunFactory):
    status = Run.Status.NEW
    method_PIXE = True


class ObjectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Object

    label = factory.Faker("words")


class ObjectGroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ObjectGroup

    label = factory.Faker("words")
    dating = factory.fuzzy.FuzzyChoice(["XXe", "XIXe", "XVIIIe", "XVIIe"])
    materials = factory.fuzzy.FuzzyChoice(["wood", "stone", "glass", "metal"], list)

    @factory.post_generation
    def objects(self, *args, **kwargs):
        return ObjectFactory.create_batch(3, group_id=self.id)

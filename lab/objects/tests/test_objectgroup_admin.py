from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory, TestCase
from django.urls import reverse

from lab.tests.factories import ObjectFactory, ObjectGroupFactory

from ...admin.object import ObjectGroupAdmin
from ...models.run import ObjectGroup


class TestGetAreObjectsDifferentiated(TestCase):
    @staticmethod
    def test_get_are_objects_differentiated_on_change():
        objectgroup = ObjectGroupFactory()
        ObjectFactory(group=objectgroup)
        admin = ObjectGroupAdmin(ObjectGroup, admin_site=AdminSite())
        data = {}
        request = RequestFactory().post(
            reverse("admin:lab_objectgroup_change", args=[objectgroup.id]), data=data
        )

        assert admin.get_are_objects_differentiated(request, objectgroup)

    @staticmethod
    def test_get_are_objects_differentiated_on_post():
        objectgroup = ObjectGroup(id=1)
        admin = ObjectGroupAdmin(ObjectGroup, admin_site=AdminSite())
        request_with_differentiated_objects = RequestFactory().post(
            reverse("admin:lab_objectgroup_change", args=[objectgroup.id]),
            data={"object_set-TOTAL_FORMS": "12"},
        )
        request_without_differentiated_objects = RequestFactory().post(
            reverse("admin:lab_objectgroup_change", args=[objectgroup.id]),
            data={"object_set-TOTAL_FORMS": "0"},
        )

        assert admin.get_are_objects_differentiated(request_with_differentiated_objects)
        assert not admin.get_are_objects_differentiated(
            request_without_differentiated_objects
        )

    @staticmethod
    def test_get_are_objects_differentiated_on_get():
        objectgroup = ObjectGroup(id=1)
        admin = ObjectGroupAdmin(ObjectGroup, admin_site=AdminSite())
        request = RequestFactory().get(
            reverse("admin:lab_objectgroup_change", args=[objectgroup.id]),
        )
        assert not admin.get_are_objects_differentiated(request)

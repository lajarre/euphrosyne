from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory, TestCase
from django.urls import reverse

from lab.tests.factories import ObjectGroupFactory

from ...admin.object import ObjectFormSet, ObjectInline
from ...models.run import ObjectGroup


class TestObjectFormset(TestCase):
    @staticmethod
    def test_updates_object_count_on_save():
        objectgroup: ObjectGroup = ObjectGroupFactory(object_count=0)
        inline = ObjectInline(ObjectGroup, admin_site=AdminSite())
        data = {
            "object_set-TOTAL_FORMS": "2",
            "object_set-INITIAL_FORMS": "0",
            "object_set-MIN_NUM_FORMS": "0",
            "object_set-MAX_NUM_FORMS": "1000",
            "object_set-0-group": objectgroup.id,
            "object_set-0-label": "1",
            "object_set-0-inventory": "",
            "object_set-0-collection": "",
            "object_set-1-group": objectgroup.id,
            "object_set-1-label": "2",
            "object_set-1-inventory": "",
            "object_set-1-collection": "",
        }
        request = RequestFactory().post(
            reverse("admin:lab_objectgroup_change", args=[objectgroup.id]), data=data
        )

        formset: ObjectFormSet = inline.get_formset(request, objectgroup)(
            data=data, instance=objectgroup
        )
        formset.is_valid()
        formset.save(commit=True)

        objectgroup.refresh_from_db()
        assert objectgroup.object_count == objectgroup.object_set.count()

    @staticmethod
    def test_does_not_update_object_count_when_no_objects():
        objectgroup: ObjectGroup = ObjectGroupFactory(object_count=3)
        objectgroup.object_set.all().delete()
        inline = ObjectInline(ObjectGroup, admin_site=AdminSite())
        data = {
            "object_set-TOTAL_FORMS": "0",
            "object_set-INITIAL_FORMS": "0",
            "object_set-MIN_NUM_FORMS": "0",
            "object_set-MAX_NUM_FORMS": "1000",
        }
        request = RequestFactory().post(
            reverse("admin:lab_objectgroup_change", args=[objectgroup.id]), data=data
        )

        formset: ObjectFormSet = inline.get_formset(request, objectgroup)(
            data=data, instance=objectgroup
        )
        formset.is_valid()
        formset.save(commit=True)

        objectgroup.refresh_from_db()
        assert objectgroup.object_count == 3

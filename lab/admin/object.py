from typing import Any, Dict, List, Mapping, Optional, Tuple

from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.http.request import HttpRequest
from django.utils.translation import gettext_lazy as _

from ..forms import ObjectGroupForm
from ..models import Object, ObjectGroup
from ..permissions import is_lab_admin


class ObjectInline(admin.TabularInline):
    model = Object
    verbose_name = _("Object")
    fields = (
        "label",
        "total_number",
        "differentiation_information",
        "inventory",
        "collection",
    )
    extra = 1

    def has_view_permission(
        self, request: HttpRequest, obj: Optional[ObjectGroup] = None
    ) -> bool:
        return True

    def has_change_permission(
        self, request: HttpRequest, obj: Optional[ObjectGroup] = None
    ) -> bool:
        return True

    def has_add_permission(
        self, request: HttpRequest, obj: Optional[ObjectGroup] = None
    ) -> bool:
        return True

    def has_delete_permission(
        self, request: HttpRequest, obj: Optional[ObjectGroup] = None
    ) -> bool:
        return True

    def get_max_num(
        self,
        request: HttpRequest,
        obj: Optional[ObjectGroup] = None,
        **kwargs: Mapping[str, Any]
    ) -> Optional[int]:
        if obj and obj.object_set.count() == 1:
            return 1
        return super().get_max_num(request, obj=obj, **kwargs)


@admin.register(ObjectGroup)
class ObjectGroupAdmin(ModelAdmin):
    form = ObjectGroupForm

    inlines = (ObjectInline,)

    class Media:
        js = ("js/admin/object-group.js",)
        css = {"all": ("css/admin/object-group.css",)}

    def has_add_permission(self, request: HttpRequest) -> bool:
        return request.user.is_staff

    def has_change_permission(
        self, request: HttpRequest, obj: Optional[ObjectGroup] = None
    ) -> bool:
        return is_lab_admin(request.user) or (
            obj and obj.runs.filter(project__members=request.user.id).exists()
        )

    def get_fieldsets(
        self, request: HttpRequest, obj: Optional[ObjectGroup] = None
    ) -> List[Tuple[Optional[str], Dict[str, Any]]]:
        return [
            (
                None,
                {
                    "fields": self.get_fields(request, obj),
                    "description": _(
                        "An object group can contain multiple objects \
                        or just one object. You can specify collection\
                        and inventory at the group level or per object.\
                        Use the total number field in the case of multiple \
                        similar objects."
                    ),
                },
            )
        ]

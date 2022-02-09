from typing import Any, Dict, List, Mapping, Optional, Tuple

from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.forms import BaseInlineFormSet
from django.http.request import HttpRequest
from django.utils.translation import gettext_lazy as _

from ..forms import ObjectGroupForm
from ..models import Object, ObjectGroup
from ..permissions import is_lab_admin


class ObjectFormSet(BaseInlineFormSet):
    def save(self, commit: bool = True):
        saved_objects = super().save(commit)
        object_set_count = self.instance.object_set.count()
        if self.instance.object_count != object_set_count:
            self.instance.object_count = object_set_count
            self.instance.save()
        return saved_objects


class ObjectInline(admin.TabularInline):
    model = Object
    verbose_name = _("Object")
    template = "admin/edit_inline/tabular_object_in_objectgroup.html"
    fields = (
        "label",
        "inventory",
        "collection",
    )
    extra = 0

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

    def get_formset(
        self, request: Any, obj: Optional[ObjectGroup] = None, **kwargs: Any
    ):
        if request.method == "POST":
            # Forbids empty form in formset to enforce object_count is equal to
            # number of differentiared objects.
            kwargs["min_num"] = int(request.POST["object_set-TOTAL_FORMS"])
        return super().get_formset(request, obj, formset=ObjectFormSet, **kwargs)

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
    inlines = (ObjectInline,)
    form = ObjectGroupForm

    class Media:
        js = ("pages/object-group.js",)
        css = {"all": ("css/admin/object-group.css",)}

    def has_add_permission(self, request: HttpRequest) -> bool:
        return request.user.is_staff

    def has_change_permission(
        self, request: HttpRequest, obj: Optional[ObjectGroup] = None
    ) -> bool:
        return is_lab_admin(request.user) or (
            obj and obj.runs.filter(project__members=request.user.id).exists()
        )

    def changeform_view(
        self,
        request: HttpRequest,
        object_id: Optional[str] = None,
        form_url: str = "",
        extra_context: Optional[Dict[str, bool]] = None,
    ) -> Any:
        obj: ObjectGroup = self.get_object(request, object_id=object_id)
        if obj:
            are_objects_differentiated = obj.object_set.exists()
        elif request.method == "POST" and "object_set-TOTAL_FORMS" in request.POST:
            are_objects_differentiated = int(request.POST["object_set-TOTAL_FORMS"]) > 0
        else:
            are_objects_differentiated = False

        return super().changeform_view(
            request,
            object_id,
            form_url,
            extra_context={
                **(extra_context if extra_context else {}),
                "are_objects_differentiated": are_objects_differentiated,
            },
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

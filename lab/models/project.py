from typing import Optional

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from shared.models import TimestampedModel

from .participation import Participation


class ProjectStatus(models.IntegerChoices):
    TO_SCHEDULE = 1, _("To schedule")
    SCHEDULED = 11, _("Scheduled")
    ONGOING = 21, _("Ongoing")
    FINISHED = 31, _("Finished")


class BeamTimeRequestType(models.TextChoices):
    FRENCH = "French", _("French")
    EUROPEAN = "European", _("European")
    C2RMF = "C2RMF"
    AGLAE = "AGLAE"


class BeamTimeRequestFormType(models.TextChoices):
    SCIENCESCALL = "Sciencescall"
    HYPERION = "IPERION"
    OSCAR = "OSCAR"


class Project(TimestampedModel):
    """A project is a collection of runs done by the same team"""

    class Meta:
        verbose_name = _("Project")
        verbose_name_plural = _("Projects")

    name = models.CharField(_("Project name"), max_length=255, unique=True)

    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, through="lab.Participation", verbose_name=_("Members")
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="projects_as_admin",
        verbose_name=_("Administrator"),
    )

    comments = models.TextField(_("Comments"), blank=True)

    status = models.IntegerField(
        _("Status"),
        choices=ProjectStatus.choices,
        default=ProjectStatus.TO_SCHEDULE,
    )

    def __str__(self):
        return f"{self.name}"

    @property
    def leader(self) -> Optional["Participation"]:
        try:
            return self.participation_set.get(is_leader=True)
        except Participation.DoesNotExist:
            return None


class BeamTimeRequest(TimestampedModel):
    """A request to use AGLAE. The request can be related to an external form."""

    class Meta:
        verbose_name = _("Beam time request")
        verbose_name_plural = _("Beam time requests")

    project = models.OneToOneField("lab.Project", on_delete=models.CASCADE)

    request_type = models.CharField(
        _("Request type"), max_length=45, choices=BeamTimeRequestType.choices
    )

    request_id = models.CharField(
        _("Request ID"),
        max_length=45,
        blank=True,
        help_text=_("ID appearing on the official form"),
    )

    problem_statement = models.TextField(
        _("Problem statement"),
        max_length=350,
        blank=True,
        help_text=_(
            "Description of the problematic being studied with the beam analysis"
        ),
    )

    form_type = models.CharField(
        _("Form type"),
        max_length=45,
        blank=True,
        choices=BeamTimeRequestFormType.choices,
    )

    def __str__(self) -> str:
        return f"Request for project {self.project}"

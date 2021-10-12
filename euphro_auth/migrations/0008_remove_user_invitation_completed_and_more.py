# Generated by Django 4.0a1 on 2021-10-12 13:06

from django.db import migrations, models
from django.utils import timezone


def fill_invitation_completed_at(apps, _):
    user_model = apps.get_model("euphro_auth", "User")
    user_model.objects.filter(invitation_completed=True).update(
        invitation_completed_at=timezone.now()
    )


def reverse_fill_invitation_completed_at(apps, _):
    user_model = apps.get_model("euphro_auth", "User")
    user_model.objects.filter(invitation_completed_at__isnull=False).update(
        invitation_completed=True
    )


class Migration(migrations.Migration):

    dependencies = [
        ("euphro_auth", "0007_delete_userinvitation_userinvitation"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="invitation_completed_at",
            field=models.DateTimeField(
                blank=True, null=True, verbose_name="invitation completed at"
            ),
        ),
        migrations.RunPython(
            fill_invitation_completed_at, reverse_fill_invitation_completed_at
        ),
        migrations.RemoveField(
            model_name="user",
            name="invitation_completed",
        ),
    ]

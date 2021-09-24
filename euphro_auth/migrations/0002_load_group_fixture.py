# Generated by Django 4.0a1 on 2021-09-24 12:02
import pathlib

from django.db import migrations
from django.core.management import call_command
from django.contrib.contenttypes.management import create_contenttypes
from django.contrib.auth.management import create_permissions
from django.apps import apps


def load_fixture(_, __):
    fixture_filename = (pathlib.Path(__file__)).with_suffix(".yaml").name

    # We need to ensure that all content types and permissions are present for
    # TransactionTestCase tests to work well.
    for config in apps.app_configs.values():
        create_contenttypes(config)
        create_permissions(config)

    call_command("loaddata", fixture_filename, format="yaml", app="euphro_auth")


class Migration(migrations.Migration):

    dependencies = [
        ("euphro_auth", "0001_initial"),
    ]

    operations = [migrations.RunPython(load_fixture, lambda *x: None)]
# Generated by Django 4.0a1 on 2021-10-07 11:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('euphro_auth', '0005_delete_extra_groups'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('lab', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Participation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True, help_text='Date this entry was first created', verbose_name='Created')),
                ('modified', models.DateTimeField(auto_now=True, help_text='Date this entry was most recently changed.', verbose_name='Modified')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True, help_text='Date this entry was first created', verbose_name='Created')),
                ('modified', models.DateTimeField(auto_now=True, help_text='Date this entry was most recently changed.', verbose_name='Modified')),
                ('name', models.CharField(max_length=255, unique=True, verbose_name='Project name')),
                ('leader', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='projects_as_leader', to='euphro_auth.user')),
                ('members', models.ManyToManyField(through='lab.Participation', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Run',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True, help_text='Date this entry was first created', verbose_name='Created')),
                ('modified', models.DateTimeField(auto_now=True, help_text='Date this entry was most recently changed.', verbose_name='Modified')),
                ('label', models.CharField(max_length=255, unique=True, verbose_name='Run label')),
                ('date', models.DateTimeField(blank=True, verbose_name='Run date')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='lab.project')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.DeleteModel(
            name='Experiment',
        ),
        migrations.AddField(
            model_name='participation',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='lab.project'),
        ),
        migrations.AddField(
            model_name='participation',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='euphro_auth.user'),
        ),
    ]
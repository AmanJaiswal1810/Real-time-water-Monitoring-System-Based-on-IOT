# Generated by Django 5.0.2 on 2024-02-18 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='iotData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('temperature', models.FloatField()),
                ('pHValue', models.FloatField()),
                ('turbidity', models.FloatField()),
            ],
        ),
    ]

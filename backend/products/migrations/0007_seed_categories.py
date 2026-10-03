from django.db import migrations


def create_categories(apps, schema_editor):
    Category = apps.get_model("products", "Category")

    categories = [
        ("Electronics", "electronics"),
        ("Phones", "phones"),
        ("Laptops", "laptops"),
        ("Accessories", "accessories"),
    ]

    for name, slug in categories:
        Category.objects.get_or_create(
            slug=slug,
            defaults={
                "name": name,
            },
        )


def remove_categories(apps, schema_editor):
    Category = apps.get_model("products", "Category")

    Category.objects.filter(
        slug__in=[
            "electronics",
            "phones",
            "laptops",
            "accessories",
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0006_category_product_category"),
    ]

    operations = [
        migrations.RunPython(
            create_categories,
            remove_categories,
        ),
    ]

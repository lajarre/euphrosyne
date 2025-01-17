from ..models.project import Project, ProjectStatus
from ..templatetags.list_results import project_results


def test_custom_result_list():
    project = Project(status=ProjectStatus.ONGOING)

    assert project_results(0, [project], [["old status repr"]]) == [
        [
            '<td class="field-status"><span class="fr-tag ongoing">'
            "A planifier"
            "</span></td>"
        ]
    ]

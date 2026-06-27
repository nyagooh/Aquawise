from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.networks.models import NetworkUpload, WaterNetwork

from .models import SimulationRun


class SimulationRunListView(APIView):
    def get(self, request):
        runs = SimulationRun.objects.filter(
            network__organisation=request.user.organisation
        ).order_by("-created_at")[:20]
        return Response([_run_summary(r) for r in runs])

    def post(self, request):
        network_id = request.data.get("network_id")
        if not network_id:
            return Response({"error": "network_id required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            network = WaterNetwork.objects.get(pk=network_id, organisation=request.user.organisation)
        except WaterNetwork.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return _trigger_run(request, network)


class SimulationRunDetailView(APIView):
    def get(self, request, pk):
        try:
            run = SimulationRun.objects.get(pk=pk, network__organisation=request.user.organisation)
        except SimulationRun.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        data = _run_summary(run)
        if run.status == SimulationRun.Status.COMPLETE and run.result:
            data["result"] = run.result
        return Response(data)


def _trigger_run(request, network: WaterNetwork):
    """Find the latest completed EPANET upload for network and queue a simulation run."""
    upload = (
        NetworkUpload.objects.filter(
            network=network,
            file_type__in=["epanet_inp", "epanet"],
            status__in=[NetworkUpload.Status.COMPLETE, NetworkUpload.Status.COMPLETE_WITH_WARNINGS],
        )
        .order_by("-uploaded_at")
        .first()
    )
    if not upload:
        return Response(
            {"error": "No completed EPANET .inp upload found for this network. Upload an .inp file first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    run = SimulationRun.objects.create(
        network=network,
        created_by=request.user,
        inp_file_path=upload.file_path,
    )

    from .tasks import run_simulation
    try:
        run_simulation.delay(str(run.id))
    except Exception:
        run_simulation.apply(args=[str(run.id)])

    return Response(_run_summary(run), status=status.HTTP_202_ACCEPTED)


def _run_summary(run: SimulationRun) -> dict:
    return {
        "id": str(run.id),
        "network_id": str(run.network_id),
        "status": run.status,
        "error_message": run.error_message or None,
        "duration_seconds": run.duration_seconds,
        "wntr_version": run.wntr_version or None,
        "created_at": run.created_at,
        "completed_at": run.completed_at,
    }


class PressureResultView(APIView):
    def get(self, request, pk=None):
        return Response({"detail": "Not yet implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)


class PressureSpatialView(APIView):
    def get(self, request, pk=None):
        return Response({"detail": "Not yet implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)


class FlowResultView(APIView):
    def get(self, request, pk=None):
        return Response({"detail": "Not yet implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)


class ScenarioListView(APIView):
    def get(self, request, pk=None):
        return Response({"detail": "Not yet implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

    def post(self, request):
        return Response({"detail": "Not yet implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

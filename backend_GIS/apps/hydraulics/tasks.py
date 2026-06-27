import logging
import os
import re
import tempfile
import time

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, ignore_result=True)
def run_simulation(self, run_id: str):
    from apps.hydraulics.models import SimulationRun

    try:
        run = SimulationRun.objects.get(id=run_id)
    except SimulationRun.DoesNotExist:
        logger.error("SimulationRun %s not found", run_id)
        return

    run.status = SimulationRun.Status.RUNNING
    run.save(update_fields=["status"])

    start = time.time()
    tmp_path = None

    try:
        import wntr

        if not os.path.exists(run.inp_file_path):
            raise FileNotFoundError(f"EPANET .inp not found: {run.inp_file_path}")

        with open(run.inp_file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        content = _sanitize_options_statistic(content)

        with tempfile.NamedTemporaryFile(suffix=".inp", mode="w", delete=False, encoding="utf-8") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        wn = wntr.network.WaterNetworkModel(tmp_path)
        # WNTRSimulator is pure-Python but doesn't support all EPANET features
        # (e.g. variable-speed pumps). Fall back to EpanetSimulator which uses
        # the bundled EPANET 2 engine and supports the full spec.
        try:
            sim = wntr.sim.WNTRSimulator(wn)
            results = sim.run_sim()
        except Exception as wntr_err:
            logger.info("WNTRSimulator failed (%s), retrying with EpanetSimulator", wntr_err)
            wn2 = wntr.network.WaterNetworkModel(tmp_path)
            sim2 = wntr.sim.EpanetSimulator(wn2)
            results = sim2.run_sim()

        timesteps = [int(t) for t in results.node["pressure"].index]

        nodes_sim = {}
        for name in results.node["pressure"].columns.tolist():
            nodes_sim[name] = {
                "pressure": results.node["pressure"][name].tolist(),
                "demand": (
                    results.node["demand"][name].tolist()
                    if "demand" in results.node
                    else [0.0] * len(timesteps)
                ),
            }

        links_sim = {}
        for name in results.link["flowrate"].columns.tolist():
            statuses = (
                results.link["status"][name].tolist()
                if "status" in results.link
                else [1.0] * len(timesteps)
            )
            links_sim[name] = {
                "flow": results.link["flowrate"][name].tolist(),
                "velocity": (
                    results.link["velocity"][name].tolist()
                    if "velocity" in results.link
                    else [0.0] * len(timesteps)
                ),
                "status": ["closed" if s == 0 else "open" for s in statuses],
            }

        patterns = {}
        for p_name in wn.pattern_name_list:
            p = wn.get_pattern(p_name)
            patterns[p_name] = list(p.multipliers)

        controls = [str(ctrl) for _, ctrl in wn.controls()]

        run.result = {
            "network_id": str(run.network_id),
            "timesteps": timesteps,
            "nodes": nodes_sim,
            "links": links_sim,
            "patterns": patterns,
            "controls": controls,
        }
        run.status = SimulationRun.Status.COMPLETE
        run.wntr_version = wntr.__version__
        logger.info("Simulation %s complete: %d timesteps", run_id, len(timesteps))

    except Exception as exc:
        logger.exception("Simulation failed for run %s", run_id)
        run.status = SimulationRun.Status.FAILED
        run.error_message = str(exc)

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

    run.duration_seconds = time.time() - start
    run.completed_at = timezone.now()
    run.save(update_fields=["status", "result", "error_message", "duration_seconds", "completed_at", "wntr_version"])


def _sanitize_options_statistic(content: str) -> str:
    """Replace 'Average' statistic → 'AVERAGED' only inside the [OPTIONS] section."""
    lines = content.splitlines(keepends=True)
    in_options = False
    out = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("[") and "]" in stripped:
            section = stripped[1:stripped.index("]")].upper()
            in_options = (section == "OPTIONS")
        if in_options and re.match(r"\s*statistic\s+average\s*$", line, re.IGNORECASE):
            line = re.sub(r"(?i)(statistic\s+)average", r"\1AVERAGED", line)
        out.append(line)
    return "".join(out)

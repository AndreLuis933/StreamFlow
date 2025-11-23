import logging
import time
from contextlib import contextmanager

# --- CONFIGURAÇÃO DE LOGGING DE PERFORMANCE ---
ENABLE_PERF_LOGS = False  # Mude para False para desativar todos os logs de performance

# Configuração do logger isolado
perf_logger = logging.getLogger("performance_tracker")
perf_logger.setLevel(logging.INFO if ENABLE_PERF_LOGS else logging.CRITICAL)
perf_logger.propagate = False  # Impede que misture com logs do FastAPI/Uvicorn

# Handler para o console
if not perf_logger.handlers:
    ch = logging.StreamHandler()
    # Formato simples: [PERF] [Nome da Tarefa] demorou X segundos
    formatter = logging.Formatter("%(asctime)s - [PERF] %(message)s", datefmt="%H:%M:%S")
    ch.setFormatter(formatter)
    perf_logger.addHandler(ch)


@contextmanager
def measure_time(task_name: str):
    """Mede o tempo de execução de um bloco de código."""
    if not ENABLE_PERF_LOGS:
        yield
        return

    start_time = time.perf_counter()
    try:
        yield
    finally:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        perf_logger.info(f"[{task_name}] demorou {elapsed:.4f}s")

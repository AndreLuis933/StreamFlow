from __future__ import annotations

from collections import defaultdict


def build_hash_map(hashes: list[dict]) -> dict:
    d = defaultdict(list)
    for it in hashes:
        d[it["hash"]].append(float(it["time"]))
    return d


def match_fingerprints_and_estimate_duration(
    stored_hash_map: dict,
    target_hashes: list[dict],
    dt_bucket_ms: int = 100,
    gap_threshold_s: float = 2.0,
) -> None | dict:
    """Retorna dict com offset_sec, matches, start_stored_sec, start_target_sec, duration_est_sec, pairs."""
    buckets = defaultdict(list)
    for th in target_hashes:
        h = th["hash"]
        del_t = float(th["time"])
        if h not in stored_hash_map:
            continue
        for del_s in stored_hash_map[h]:
            delta = del_t - del_s
            bucket = int(round(delta * 1000 / dt_bucket_ms))
            buckets[bucket].append((del_s, del_t))

    if not buckets:
        return None

    best_bucket = max(buckets.keys(), key=lambda k: len(buckets[k]))
    pairs = buckets[best_bucket]
    total_matches = len(pairs)
    best_delta_sec = (best_bucket * dt_bucket_ms) / 1000.0

    stored_times = sorted({p[0] for p in pairs})
    if not stored_times:
        return None

    clusters = []
    cur = [stored_times[0]]
    for t in stored_times[1:]:
        if t - cur[-1] <= gap_threshold_s:
            cur.append(t)
        else:
            clusters.append(cur)
            cur = [t]
    clusters.append(cur)

    best_cluster = max(clusters, key=lambda c: (len(c), c[-1] - c[0]))
    duration_est = best_cluster[-1] - best_cluster[0]
    start_stored = best_cluster[0]
    start_target = start_stored + best_delta_sec

    return {
        "offset_sec": best_delta_sec,
        "matches": total_matches,
        "start_stored_sec": float(start_stored),
        "start_target_sec": float(start_target),
        "duration_est_sec": float(duration_est),
        "pairs": pairs,
    }


def match_hashes_find_timing(stored_hash_map, target_hashes, dt_bucket_ms=100, gap_threshold_s=2.0):
    """Faz matching entre fingerprints do trecho-alvo e do novo áudio.
    Retorna dict com:
      - offset_sec: offset mais frequente
      - matches: número de hashes casados
      - start_sec: início estimado no target
      - duration_sec: duração estimada do trecho.
    """
    buckets = defaultdict(list)

    for th in target_hashes:
        h = th["hash"]
        tT = float(th["time"])
        if h not in stored_hash_map:
            continue
        for tS in stored_hash_map[h]:
            delta = tT - tS
            bucket = int(round(delta * 1000 / dt_bucket_ms))
            buckets[bucket].append((tS, tT))

    if not buckets:
        return None

    best_bucket = max(buckets.keys(), key=lambda k: len(buckets[k]))
    pairs = buckets[best_bucket]
    total_matches = len(pairs)
    best_delta_sec = (best_bucket * dt_bucket_ms) / 1000.0

    # Estimar duração com base nos tempos do target (tT)
    target_times = sorted({p[1] for p in pairs})
    if not target_times:
        return None

    clusters = []
    cur = [target_times[0]]
    for t in target_times[1:]:
        if t - cur[-1] <= gap_threshold_s:
            cur.append(t)
        else:
            clusters.append(cur)
            cur = [t]
    clusters.append(cur)

    best_cluster = max(clusters, key=lambda c: (len(c), c[-1] - c[0]))
    start_sec = best_cluster[0]
    end_sec = best_cluster[-1]
    duration = end_sec - start_sec

    return {"start_sec": start_sec, "end_sec": end_sec, "duration": duration}

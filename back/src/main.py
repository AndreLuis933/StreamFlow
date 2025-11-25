import asyncio
import json

import boto3
from config.loggin import measure_time
from firebase.firebase_consult import consult_seguement
from run import find_seguement_request

lambda_client = boto3.client("lambda")


def handler(event, context):
    """Dois modos:
    - Modo API (vindo do API Gateway): não tem 'background' ou background == False
    - Modo background: event['background'] == True.
    """
    # 1) MODO BACKGROUND: chamado pela própria Lambda
    if event.get("background"):
        path = event["path"]
        anime = event["anime"]
        ep = event["ep"]

        try:
            asyncio.run(process_request(path, anime, ep))
        except Exception as e:
            print(f"Erro no processamento em background: {e}")

        return {"statusCode": 200, "body": json.dumps({"message": "Processamento finalizado"})}

    # 2) MODO API: chamado pelo API Gateway (request do cliente)
    path = event.get("resource", "") or event.get("path", "")
    query_params = event.get("queryStringParameters", {}) or {}
    anime = query_params.get("anime")
    ep = query_params.get("ep")

    if not anime or not ep:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Parametros 'anime' e 'ep' sao obrigatorios"}),
        }

    path_segment = path.strip("/")

    if consult_seguement(anime, ep, path_segment) is None:
        lambda_client.invoke(
            FunctionName=context.function_name,
            InvocationType="Event",
            Payload=json.dumps(
                {
                    "background": True,
                    "path": path_segment,
                    "anime": anime,
                    "ep": ep,
                },
            ),
        )
    return {
        "statusCode": 202,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"message": "Processamento iniciado", "anime": anime, "ep": ep}),
    }


async def process_request(path, anime, ep):
    result = None

    if path == "intro":
        with measure_time("Tempo total da tarefa - intro"):
            result = await find_seguement_request(anime, ep, "intro")

    elif path == "credits":
        with measure_time("Tempo total da tarefa - credits"):
            result = await find_seguement_request(anime, ep, "credits")

    else:
        print({"error": "Rota nao encontrada"})
        return

    print("Resultado:", result)

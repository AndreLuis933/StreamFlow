import asyncio
import json

import boto3
from config.loggin import measure_time
from firebase.firebase_consult import consult_segment
from run import find_segment_request

lambda_client = boto3.client("lambda")


def handler(event, context):
    if event.get("background"):
        path = event["path"]
        title = event["title"]
        ep = event["ep"]

        asyncio.run(process_request(path, title, ep))

        return {"statusCode": 200, "body": json.dumps({"message": "Processamento finalizado"})}

    path = event.get("resource", "") or event.get("path", "")
    query_params = event.get("queryStringParameters", {}) or {}
    title = query_params.get("nome")
    ep = int(query_params.get("ep"))

    if not title or not ep:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Parametros 'nome' e 'ep' sao obrigatorios"}),
        }

    path_segment = path.strip("/")

    if consult_segment(title, ep, path_segment) is None:
        lambda_client.invoke(
            FunctionName=context.function_name,
            InvocationType="Event",
            Payload=json.dumps(
                {
                    "background": True,
                    "path": path_segment,
                    "title": title,
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
        "body": json.dumps({"message": "Processamento iniciado", "title": title, "ep": ep}),
    }


async def process_request(path, title, ep):
    result = None

    if path == "intro":
        with measure_time("Tempo total da tarefa - intro"):
            result = await find_segment_request(title, ep, "intro")

    elif path == "credits":
        with measure_time("Tempo total da tarefa - credits"):
            result = await find_segment_request(title, ep, "credits")

    else:
        print({"error": "Rota nao encontrada"})
        return

    print("Resultado:", result)

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export type Bindings = {
	AWS_ACCESS_KEY_ID: string;
	AWS_SECRET_ACCESS_KEY: string;
	AWS_REGION: string;
	S3_BUCKET: string;
};

export function createS3Client(env: Bindings): S3Client {
	return new S3Client({
		region: env.AWS_REGION,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		},
	});
}

export async function getObjectFromS3(env: Bindings, key: string): Promise<{ body: ReadableStream; contentType: string }> {
	const s3 = createS3Client(env);
	const command = new GetObjectCommand({
		Bucket: env.S3_BUCKET,
		Key: key,
	});
	const response = await s3.send(command);

	return {
		body: response.Body as ReadableStream,
		contentType: response.ContentType || 'application/octet-stream',
	};
}

// Builders de chaves S3
export function buildS3KeyForM3u8(nome: string, ep: string): string {
	const epNorm = Number(ep).toString().padStart(2, '0');
	return `series/${nome}/videos/ep-${epNorm}/master.m3u8`;
}

export function buildS3KeyForSegment(nome: string, ep: string, file: string): string {
	const epNorm = Number(ep).toString().padStart(2, '0');
	return `series/${nome}/videos/ep-${epNorm}/${file}`;
}

export function buildS3KeyForDetalhesSerie(nome: string): string {
	return `series/${nome}/metadata.json`;
}

export function buildS3KeyForDetalhesEpisodio(nome: string, ep: string): string {
	return `series/${nome}/videos/${ep}/metadata.json`;
}

export function buildS3KeyForCapa(nome: string): string {
	return `series/${nome}/capa.jpg`;
}

export function buildS3KeyForEpisode(nome: string, ep: string): string {
	return `series/${nome}/videos/ep-${ep}/Cover.jpg`;
}

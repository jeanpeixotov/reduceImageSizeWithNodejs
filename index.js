import { readdirSync, readFileSync, writeFileSync, createWriteStream } from 'fs';
import path from "path";
import { emptyDirSync } from 'fs-extra';
import axios from 'axios';
import xlsx from 'node-xlsx';
import imagemin from 'imagemin';
import mozjpeg from "imagemin-mozjpeg";
import isJpg from "is-jpg";
import sharp from "sharp";

const __dirname = path.resolve();
const rawFolder = `${__dirname}/rawImages`;
const processedFolder = `${__dirname}/processedImages`;

const convertToJpg = async (input) => {
  if (isJpg(input)) {
    return input;
  }

  return sharp(input)
    .jpeg()
    .toBuffer();
};

const reduceImage = async (buffer, quality = 80) => imagemin.buffer(buffer, {
    plugins: [convertToJpg, mozjpeg({ quality })]
});

const getFileSizeInMbFromBuffer = (buffer) => Number((Buffer.byteLength(buffer, 'utf8') / (1024*1024)).toFixed(2));

const getOriginalBuffers = (filenames, folder) => {
  return filenames.map((filename) => {
		const buffer = readFileSync(`${folder}/${filename}`);
		const size = getFileSizeInMbFromBuffer(buffer);
		return { buffer, size, filename }; 
	});
};

const getImagesNames = (folder) => {
  const fileNames = readdirSync(`${folder}/`);
	return fileNames.filter(fileName => (/\.(jpe?g|)$/i).test(fileName));
};

const downloadImage = async (url, filepath) => {
	const response = await axios({
			url,
			method: 'GET',
			responseType: 'stream'
	});
	return new Promise((resolve, reject) => {
			response.data.pipe(createWriteStream(filepath))
					.on('error', (reject))
					.once('close', () => resolve(filepath)); 
	});
}

// tratar erro em downloads
const downloadImagesFromSheet = async (sheetName) => {
	console.log('Downloading...');
  const workSheetsFromFile = (xlsx.parse(`${__dirname}/${sheetName}.xlsx`))[0];
	const sheetItens = workSheetsFromFile.data.filter(d => d.length).map(d => {
		return { filename: d[0], link: d[1] }
	});

	for (const sheetIten of sheetItens) {
		if(!sheetIten.link.includes('http')) continue;
		await downloadImage(sheetIten.link, `${rawFolder}/${sheetIten.filename}.jpg`);
		console.log(`File: ${sheetIten.filename} - download done !`);
	}
};

const loadEnv = async () => {
	emptyDirSync(processedFolder);

	const quality = 90;
	const types = ['folder','sheet'];

	const sizeLimitInMb = process.env.SIZE || 0.100;
	const type = process.env.TYPE || 'sheet';

	if(!types.includes(type.toLocaleLowerCase())) throw Error('Choose a valid type - folder or sheet');

	return { sizeLimitInMb, quality, type };
};

//ADD TESTS
const main = async () => {
	try {
		const { sizeLimitInMb, type } = await loadEnv();

		if (type === 'sheet') {
			emptyDirSync(rawFolder);
			await downloadImagesFromSheet(type);
		}

		const imagesNames = getImagesNames(rawFolder);
		const originalBuffers = await getOriginalBuffers(imagesNames, rawFolder)
		const results = [];

		// melhorar lógica do loop
		// tratar possiveis erros na reducao
		let quality = 90;
		for (let index = 0; index < originalBuffers.length; index++) {

			const bufferReduced = await reduceImage(originalBuffers[index].buffer, quality);
			const actualSize = getFileSizeInMbFromBuffer(bufferReduced);
			const filename = originalBuffers[index].filename;

			if (actualSize > sizeLimitInMb) {
				console.log(`File ${filename} | quality: ${quality} | size: ${actualSize} | max: ${sizeLimitInMb} --- reducing quality...`);
				quality = quality - 5;
				index--;
			} else {
				results.push({buffer: bufferReduced, filename: originalBuffers[index].filename, metadata: `File: ${originalBuffers[index].filename} | quality: ${quality} | original size: ${originalBuffers[index].size} Mbs | actual size: ${actualSize} Mbs`});
				quality = 90;
			}		
		}

		console.log('\n\n\nSuccessfully Processed!');
		results.forEach(result => {
				writeFileSync(`${processedFolder}/${result.filename}`, result.buffer);
				console.log(result.metadata);
		});

	} catch (err) {
		console.log(`Server error :( , ${err}`)
	}
}

main();
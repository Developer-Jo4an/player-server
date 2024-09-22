const express = require("express");
const cors = require("cors");
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const port = 3001;

app.use(cors());

const upload = multer({dest: "uploads/"});
app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.post("/upload-archive", upload.single("archive"), async (req, res) => {
	try {
		const archivePath = req.file.path;
		const extractPath = path.join(__dirname, "..", "public", "assets");

		await fs.emptyDir(extractPath);

		fs.createReadStream(archivePath)
		.pipe(unzipper.Extract({path: extractPath}))
		.on("close", async () => {
			await fs.remove(archivePath);
			res.status(200).send("Файлы успешно загружены и разархивированы.");
		});
	} catch (error) {
		res.status(500).send(`Ошибка: ${error.message}`);
	}
});

app.get("/list-files", async (req, res) => {
	const filesPath = path.join(__dirname, "..", "public", "assets");
	try {
		const files = await fs.readdir(filesPath);
		res.json(files);
	} catch (error) {
		res.status(500).send(`Ошибка при получении списка файлов: ${error.message}`);
	}
});

app.delete("/clear-assets", async (req, res) => {
	const assetsPath = path.join(__dirname, "..", "public", "assets");
	try {
		await fs.emptyDir(assetsPath);
		res.status(200).send("Папка assets успешно очищена.");
	} catch (error) {
		res.status(500).send(`Ошибка при очистке папки: ${error.message}`);
	}
});

app.listen(port, () => {
	console.log(`Сервер запущен на http://localhost:${port}`);
});

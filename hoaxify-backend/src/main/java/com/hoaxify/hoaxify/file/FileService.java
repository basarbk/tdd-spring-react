package com.hoaxify.hoaxify.file;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

import org.apache.commons.io.FileUtils;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.hoaxify.hoaxify.configuration.AppConfiguration;

@Service
public class FileService {
	
	AppConfiguration appConfiguration;
	
	Tika tika;
	
	FileAttachmentRepository fileAttachmentRepository;

	public FileService(AppConfiguration appConfiguration, FileAttachmentRepository fileAttachmentRepository) {
		super();
		this.appConfiguration = appConfiguration;
		this.fileAttachmentRepository = fileAttachmentRepository;
		tika = new Tika();
	}
	
	public String saveProfileImage(String base64Image) throws IOException {
		String imageName = getRandomName();
		
		byte[] decodedBytes = Base64.getDecoder().decode(base64Image);
		File target = new File(appConfiguration.getFullProfileImagesPath() + "/" + imageName);
		FileUtils.writeByteArrayToFile(target, decodedBytes);
		return imageName;
	}

	private String getRandomName() {
		return UUID.randomUUID().toString().replaceAll("-", "");
	}

	public String detectType(byte[] fileArr) {
		return tika.detect(fileArr);
	}

	public void deleteProfileImage(String image) {
		try {
			Files.deleteIfExists(Paths.get(appConfiguration.getFullProfileImagesPath()+"/"+image));
		} catch (IOException e) {
			e.printStackTrace();
		}
		
	}

	public FileAttachment saveAttachment(MultipartFile file) {
		FileAttachment fileAttachment = new FileAttachment();
		fileAttachment.setDate(new Date());
		String randomName = getRandomName();
		fileAttachment.setName(randomName);
		
		File target = new File(appConfiguration.getFullAttachmentsPath() +"/"+randomName);
		try {
			byte[] fileAsByte = file.getBytes();
			FileUtils.writeByteArrayToFile(target, fileAsByte);
			fileAttachment.setFileType(detectType(fileAsByte));
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return fileAttachmentRepository.save(fileAttachment);
	}

}

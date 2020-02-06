package com.hoaxify.hoaxify.file;

import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;

import com.hoaxify.hoaxify.configuration.AppConfiguration;

@Service
public class FileService {
	
	AppConfiguration appConfiguration;

	public FileService(AppConfiguration appConfiguration) {
		super();
		this.appConfiguration = appConfiguration;
	}
	
	public String saveProfileImage(String base64Image) throws IOException {
		String imageName = UUID.randomUUID().toString().replaceAll("-", "");
		
		byte[] decodedBytes = Base64.getDecoder().decode(base64Image);
		File target = new File(appConfiguration.getFullProfileImagesPath() + "/" + imageName);
		FileUtils.writeByteArrayToFile(target, decodedBytes);
		return imageName;
	}

}

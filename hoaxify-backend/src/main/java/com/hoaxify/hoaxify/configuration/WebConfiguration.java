package com.hoaxify.hoaxify.configuration;

import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer{

	@Autowired
	AppConfiguration appConfiguration;
	
	@Bean
	CommandLineRunner createUploadFolder() {
		return (args) -> {

			createNonExistingFolder(appConfiguration.getUploadPath());
			createNonExistingFolder(appConfiguration.getFullProfileImagesPath());
			createNonExistingFolder(appConfiguration.getFullAttachmentsPath());
		};
	}

	private void createNonExistingFolder(String path) {
		File folder = new File(path);
		boolean folderExist = folder.exists() && folder.isDirectory();
		if(!folderExist) {
			folder.mkdir();
		}
	}

}

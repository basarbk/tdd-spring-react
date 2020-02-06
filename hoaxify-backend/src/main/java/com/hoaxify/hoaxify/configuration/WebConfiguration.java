package com.hoaxify.hoaxify.configuration;

import java.io.File;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer{
	
	@Bean
	CommandLineRunner createUploadFolder() {
		return (args) -> {

			File uploadFolder = new File("uploads-test");
			boolean uploadFolderExist = uploadFolder.exists() && uploadFolder.isDirectory();
			if(!uploadFolderExist) {
				uploadFolder.mkdir();
			}
		};
	}

}

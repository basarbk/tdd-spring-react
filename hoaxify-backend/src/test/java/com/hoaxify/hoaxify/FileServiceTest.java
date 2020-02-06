package com.hoaxify.hoaxify;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import com.hoaxify.hoaxify.configuration.AppConfiguration;
import com.hoaxify.hoaxify.file.FileService;

@RunWith(SpringRunner.class)
@ActiveProfiles("test")
public class FileServiceTest {
	
	FileService fileService;
	
	AppConfiguration appConfiguration;
	
	@Before
	public void init() {
		appConfiguration = new AppConfiguration();
		appConfiguration.setUploadPath("uploads-test");
		
		fileService = new FileService(appConfiguration, null);
		
		new File(appConfiguration.getUploadPath()).mkdir();
		new File(appConfiguration.getFullProfileImagesPath()).mkdir();
		new File(appConfiguration.getFullAttachmentsPath()).mkdir();
	}
	
	@Test
	public void detectType_whenPngFileProvided_returnsImagePng() throws IOException {
		ClassPathResource resourceFile = new ClassPathResource("test-png.png");
		byte[] fileArr = FileUtils.readFileToByteArray(resourceFile.getFile());
		String fileType = fileService.detectType(fileArr);
		assertThat(fileType).isEqualToIgnoringCase("image/png");
	}

	
	@After
	public void cleanup() throws IOException {
		FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
		FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachmentsPath()));
		
	}
	
	
	
	
}

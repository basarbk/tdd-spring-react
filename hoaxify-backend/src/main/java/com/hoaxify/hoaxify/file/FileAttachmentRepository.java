package com.hoaxify.hoaxify.file;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FileAttachmentRepository extends JpaRepository<FileAttachment, Long>{
	
	List<FileAttachment> findByDateBeforeAndHoaxIsNull(Date date);

}

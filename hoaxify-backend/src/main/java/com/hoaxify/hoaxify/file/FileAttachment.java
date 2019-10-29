package com.hoaxify.hoaxify.file;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.hoaxify.hoaxify.hoax.Hoax;

import lombok.Data;

@Data
@Entity
public class FileAttachment {
	
	@Id
	@GeneratedValue
	private long id;

	@Temporal(TemporalType.TIMESTAMP)
	private Date date;
	
	private String name;
	
	private String fileType;
	
	@OneToOne
	private Hoax hoax;
}

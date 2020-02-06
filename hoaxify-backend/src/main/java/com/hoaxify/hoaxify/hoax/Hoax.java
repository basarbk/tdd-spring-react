package com.hoaxify.hoaxify.hoax;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import lombok.Data;

@Data
@Entity
public class Hoax {
	
	@Id
	@GeneratedValue
	private long id;

	private String content;
	
	@Temporal(TemporalType.TIMESTAMP)
	private Date timestamp;
}

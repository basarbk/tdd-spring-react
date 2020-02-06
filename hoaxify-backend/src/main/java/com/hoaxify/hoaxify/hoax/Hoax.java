package com.hoaxify.hoaxify.hoax;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hoaxify.hoaxify.user.User;

import lombok.Data;

@Data
@Entity
public class Hoax {
	
	@Id
	@GeneratedValue
	private long id;

	@NotNull
	@Size(min = 10, max=5000)
	@Column(length = 5000)
	private String content;
	
	@Temporal(TemporalType.TIMESTAMP)
	private Date timestamp;
	
	@ManyToOne
	@JsonIgnore
	private User user;
}

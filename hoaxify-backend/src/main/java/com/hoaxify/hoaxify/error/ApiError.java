package com.hoaxify.hoaxify.error;

import java.util.Date;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonInclude(value = Include.NON_NULL)
public class ApiError {
	
	private long timestamp = new Date().getTime();
	
	private int status;
	
	private String message;
	
	private String url;
	
	private Map<String, String> validationErrors;

	public ApiError(int status, String message, String url) {
		super();
		this.status = status;
		this.message = message;
		this.url = url;
	}
	
}

package com.hoaxify.hoaxify.shared;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GenericResponse {

	private String message;
	
	public GenericResponse(String message) {
		this.message = message;
	}

}

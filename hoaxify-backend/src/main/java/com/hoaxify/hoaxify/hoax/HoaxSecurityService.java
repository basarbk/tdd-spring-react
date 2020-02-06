package com.hoaxify.hoaxify.hoax;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hoaxify.hoaxify.user.User;

@Service
public class HoaxSecurityService {
	
	HoaxRepository hoaxRepository;
	
	public HoaxSecurityService(HoaxRepository hoaxRepository) {
		super();
		this.hoaxRepository = hoaxRepository;
	}

	public boolean isAllowedToDelete(long hoaxId, User loggedInUser) {
		Optional<Hoax> optionalHoax = hoaxRepository.findById(hoaxId);
		if(optionalHoax.isPresent()) {
			Hoax inDB = optionalHoax.get();
			return inDB.getUser().getId() == loggedInUser.getId();
		}
		return false;
	}

}

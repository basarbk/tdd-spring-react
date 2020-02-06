package com.hoaxify.hoaxify.hoax;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.hoaxify.hoaxify.user.User;
import com.hoaxify.hoaxify.user.UserService;

@Service
public class HoaxService {
	
	HoaxRepository hoaxRepository;
	
	UserService userService;

	public HoaxService(HoaxRepository hoaxRepository, UserService userService) {
		super();
		this.hoaxRepository = hoaxRepository;
		this.userService = userService;
	}
	
	public Hoax save(User user, Hoax hoax) {
		hoax.setTimestamp(new Date());
		hoax.setUser(user);
		return hoaxRepository.save(hoax);
	}

	public Page<Hoax> getAllHoaxes(Pageable pageable) {
		return hoaxRepository.findAll(pageable);
	}

	public Page<Hoax> getHoaxesOfUser(String username, Pageable pageable) {
		User inDB = userService.getByUsername(username);
		return hoaxRepository.findByUser(inDB, pageable);
	}

	public Page<Hoax> getOldHoaxes(long id, Pageable pageable) {
		return hoaxRepository.findByIdLessThan(id, pageable);
	}

	public Page<Hoax> getOldHoaxesOfUser(long id, String username, Pageable pageable) {
		User inDB = userService.getByUsername(username);
		return hoaxRepository.findByIdLessThanAndUser(id, inDB, pageable);
	}

	public List<Hoax> getNewHoaxes(long id, Pageable pageable) {
		return hoaxRepository.findByIdGreaterThan(id, pageable.getSort());
	}

	public List<Hoax> getNewHoaxesOfUser(long id, String username, Pageable pageable) {
		User inDB = userService.getByUsername(username);
		return hoaxRepository.findByIdGreaterThanAndUser(id, inDB, pageable.getSort());
	}

	public long getNewHoaxesCount(long id) {
		return hoaxRepository.countByIdGreaterThan(id);
	}

	public long getNewHoaxesCountOfUser(long id, String username) {
		User inDB = userService.getByUsername(username);
		return hoaxRepository.countByIdGreaterThanAndUser(id, inDB);
	}

}

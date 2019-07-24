package com.hoaxify.hoaxify.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long>{
	
	User findByUsername(String username);

	@Query("Select u from User u")
	Page<UserProjection> getAllUsersProjection(Pageable pageable);
}

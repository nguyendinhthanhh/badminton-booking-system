package com.badminton.booking.repository;

import com.badminton.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.username = :username AND u.isActive = true")
    Optional<User> findByUsername(@Param("username") String username);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.username = :username")
    Optional<User> findByUsernameIncludingInactive(@Param("username") String username);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isActive = true")
    Optional<User> findByEmail(@Param("email") String email);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.username = :username AND u.isActive = true")
    Boolean existsByUsername(@Param("username") String username);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.isActive = true")
    Boolean existsByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.role.roleName = :roleName AND u.isActive = true")
    List<User> findByRole_RoleName(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE u.id = :id AND u.isActive = true")
    Optional<User> findByIdAndActiveTrue(@Param("id") Integer id);
}

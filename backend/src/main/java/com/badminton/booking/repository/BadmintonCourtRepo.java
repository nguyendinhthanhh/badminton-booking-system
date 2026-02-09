package com.badminton.booking.repository;

import com.badminton.booking.entity.BadmintonCourt;
import com.badminton.booking.entity.enums.CourtStatus;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadmintonCourtRepo
        extends JpaRepository<BadmintonCourt, Integer>, JpaSpecificationExecutor<BadmintonCourt> {

    // Return a Slice to avoid the COUNT query when pagination count is not required
    Slice<BadmintonCourt> findAllBy(Pageable pageable);

    // Additional methods needed for data seeder
    List<BadmintonCourt> findByStatus(CourtStatus status);

    // Fetch court with images eagerly to avoid lazy loading issues
    @org.springframework.data.jpa.repository.Query("SELECT c FROM BadmintonCourt c LEFT JOIN FETCH c.images WHERE c.id = :id")
    java.util.Optional<BadmintonCourt> findByIdWithImages(
            @org.springframework.data.repository.query.Param("id") Integer id);
}

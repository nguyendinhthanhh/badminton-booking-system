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

    // ── Availability queries ─────────────────────────────────────────────────

    /**
     * All ACTIVE courts with their images eagerly loaded (avoids N+1 on bulk calls).
     * Used when NO courts are booked for the requested slot.
     */
    @org.springframework.data.jpa.repository.Query(
            "SELECT DISTINCT c FROM BadmintonCourt c LEFT JOIN FETCH c.images " +
            "WHERE c.status = :status " +
            "ORDER BY c.id ASC")
    List<BadmintonCourt> findByStatusWithImages(
            @org.springframework.data.repository.query.Param("status") CourtStatus status);

    /**
     * ACTIVE courts whose ID is NOT in the given booked-ID list, images eagerly loaded.
     * Used when at least one court is already booked for the requested slot.
     */
    @org.springframework.data.jpa.repository.Query(
            "SELECT DISTINCT c FROM BadmintonCourt c LEFT JOIN FETCH c.images " +
            "WHERE c.status = :status " +
            "AND c.id NOT IN :bookedIds " +
            "ORDER BY c.id ASC")
    List<BadmintonCourt> findByStatusAndIdNotInWithImages(
            @org.springframework.data.repository.query.Param("status") CourtStatus status,
            @org.springframework.data.repository.query.Param("bookedIds") List<Integer> bookedIds);

    // Fetch court with images eagerly to avoid lazy loading issues
    @org.springframework.data.jpa.repository.Query("SELECT c FROM BadmintonCourt c LEFT JOIN FETCH c.images WHERE c.id = :id")
    java.util.Optional<BadmintonCourt> findByIdWithImages(
            @org.springframework.data.repository.query.Param("id") Integer id);
}

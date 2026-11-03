package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Resume> findTop10ByOrderByCreatedAtDesc();

    Optional<Resume> findFirstByCandidateEmailNormalizedOrderByCreatedAtDesc(String candidateEmailNormalized);

    Optional<Resume> findFirstByCandidatePhoneNormalizedOrderByCreatedAtDesc(String candidatePhoneNormalized);

    Optional<Resume> findFirstByCandidateEmailNormalizedOrCandidatePhoneNormalizedOrderByCreatedAtDesc(
            String candidateEmailNormalized, String candidatePhoneNormalized);

    List<Resume> findByCandidateEmailNormalizedOrderByCreatedAtDesc(String candidateEmailNormalized);
}

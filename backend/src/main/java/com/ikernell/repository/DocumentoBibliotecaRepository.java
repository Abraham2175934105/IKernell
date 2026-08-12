package com.ikernell.repository;

import com.ikernell.model.DocumentoBiblioteca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoBibliotecaRepository extends JpaRepository<DocumentoBiblioteca, Long> {

    List<DocumentoBiblioteca> findAllByOrderByFechaSubidaDesc();

    List<DocumentoBiblioteca> findByCategoriaIgnoreCaseOrderByFechaSubidaDesc(String categoria);

    @Query("SELECT d FROM DocumentoBiblioteca d WHERE " +
           "LOWER(d.titulo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.descripcion) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.categoria) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY d.fechaSubida DESC")
    List<DocumentoBiblioteca> buscarDocumentos(@Param("query") String query);

    @Query("SELECT d FROM DocumentoBiblioteca d WHERE " +
           "(:categoria IS NULL OR :categoria = 'TODOS' OR LOWER(d.categoria) = LOWER(:categoria)) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(d.titulo) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.descripcion) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY d.fechaSubida DESC")
    List<DocumentoBiblioteca> filtrarDocumentos(@Param("query") String query, @Param("categoria") String categoria);
}

package com.ikernell.repository;

import com.ikernell.model.Proyecto;
import com.ikernell.model.ProyectoDesarrollador;
import com.ikernell.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProyectoDesarrolladorRepository extends JpaRepository<ProyectoDesarrollador, Long> {
    
    List<ProyectoDesarrollador> findByProyecto(Proyecto proyecto);
    
    List<ProyectoDesarrollador> findByDesarrollador(Trabajador desarrollador);
    
    Optional<ProyectoDesarrollador> findByProyectoAndDesarrollador(Proyecto proyecto, Trabajador desarrollador);

    void deleteByProyectoAndDesarrollador(Proyecto proyecto, Trabajador desarrollador);

    @org.springframework.data.jpa.repository.Query("SELECT pd FROM ProyectoDesarrollador pd LEFT JOIN FETCH pd.proyecto WHERE pd.desarrollador = :desarrollador AND pd.proyecto.estado = 'ACTIVO'")
    List<ProyectoDesarrollador> findAsignacionesActivasPorDesarrollador(@org.springframework.data.repository.query.Param("desarrollador") Trabajador desarrollador);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(pd.horasSemanales), 0) FROM ProyectoDesarrollador pd WHERE pd.desarrollador = :desarrollador AND pd.proyecto.estado = 'ACTIVO'")
    Integer calcularHorasTotalesAsignadas(@org.springframework.data.repository.query.Param("desarrollador") Trabajador desarrollador);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(pd.horasSemanales), 0) FROM ProyectoDesarrollador pd WHERE pd.desarrollador = :desarrollador AND pd.proyecto.estado = 'ACTIVO' AND pd.proyecto.idProyecto != :idProyectoExcluir")
    Integer calcularHorasAsignadasExcluyendoProyecto(
        @org.springframework.data.repository.query.Param("desarrollador") Trabajador desarrollador, 
        @org.springframework.data.repository.query.Param("idProyectoExcluir") Long idProyectoExcluir
    );

    @org.springframework.data.jpa.repository.Query("SELECT pd.desarrollador.idTrabajador, COALESCE(SUM(pd.horasSemanales), 0) FROM ProyectoDesarrollador pd WHERE pd.proyecto.estado = 'ACTIVO' GROUP BY pd.desarrollador.idTrabajador")
    List<Object[]> obtenerHorasTotalesPorDesarrollador();

    @org.springframework.data.jpa.repository.Query("SELECT pd FROM ProyectoDesarrollador pd LEFT JOIN FETCH pd.desarrollador WHERE pd.proyecto = :proyecto ORDER BY pd.idAsignacion ASC")
    List<ProyectoDesarrollador> findByProyectoWithDesarrollador(@org.springframework.data.repository.query.Param("proyecto") Proyecto proyecto);
}

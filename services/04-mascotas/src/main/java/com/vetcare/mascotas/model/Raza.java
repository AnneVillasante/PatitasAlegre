
package com.vetcare.mascotas.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "razas",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_raza",
            columnNames = {"id_especie", "nombre"}
        )
    }
)
public class Raza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_raza")
    private Integer idRaza;

    @Column(name = "id_especie", nullable = false)
    private Integer idEspecie;

    @Column(name = "nombre", nullable = false, length = 80)
    private String nombre;

    public Raza() {
    }

    public Integer getIdRaza() {
        return idRaza;
    }

    public void setIdRaza(Integer idRaza) {
        this.idRaza = idRaza;
    }

    public Integer getIdEspecie() {
        return idEspecie;
    }

    public void setIdEspecie(Integer idEspecie) {
        this.idEspecie = idEspecie;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}

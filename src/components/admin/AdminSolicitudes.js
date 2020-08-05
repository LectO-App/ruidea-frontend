import React, { useState, useEffect } from "react";
import axios from "axios";

import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

import AdminAuth from "./adminAuth";

import AdminNavbar from "./AdminNavbar";

import { GrSearch } from "react-icons/gr";

const AdminSolicitudes = (props) => {
  const optionsDropdown = [
    { value: "pendiente", label: "Pendientes" },
    { value: "aceptado", label: "Aceptados" },
    { value: "rechazado", label: "Rechazados" },
    { value: "", label: "Todos" },
  ];
  const defaultOption = optionsDropdown[0];

  const [condicion, setCondicion] = useState(defaultOption.value);

  const [numeroOrdenarActual, setNumeroOrdenarActual] = useState(1);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchData, setSearchData] = useState([]);

  const searchInData = (e) => {
    if (e.target.value === "") {
      return setSearchData([]);
    }
    const matches = data.filter((el) =>
      el.nombre.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchData(matches);
  };

  const fetchFromAPI = async (condicion) => {
    setLoading(true);
    const res = await axios.post(
      "https://ruidea.herokuapp.com/admin/solicitudes",
      { condicion }
    );
    setData(res.data);
    setLoading(false);
  };

  const checkLoggedIn = () => {
    !AdminAuth.isAuthenticated() && props.history.push("/admin/login");
  };

  useEffect(() => {
    checkLoggedIn();
    fetchFromAPI(condicion);
  }, []);

  const cerrarSesion = () => {
    AdminAuth.logout(() => {
      props.history.push("/admin");
    });
  };

  const onDropdownChange = (e) => {
    setCondicion(e.value);
    fetchFromAPI(e.value);
  };

  const ordenarArray = (number) => {
    let sortedArray = [];

    // eslint-disable-next-line default-case
    switch (number) {
      // 1 es el default, de mas viejo a mas nuevo
      case 1:
        sortedArray = [...data].sort((a, b) =>
          a.fechaCreacion > b.fechaCreacion
            ? 1
            : b.fechaCreacion > a.fechaCreacion
            ? -1
            : 0
        );
        break;
      // 2 es de mas nuevo a mas viejo
      case 2:
        sortedArray = [...data].sort((a, b) =>
          b.fechaCreacion > a.fechaCreacion
            ? 1
            : a.fechaCreacion > b.fechaCreacion
            ? -1
            : 0
        );
        break;
      // 3 es por orden alfabético
      case 3:
        sortedArray = [...data].sort((a, b) => {
          var nameA = a.nombre.toLowerCase(),
            nameB = b.nombre.toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
        break;
    }
    setData(sortedArray);
  };

  const renderBtnEstado = (item) => {
    //eslint-disable-next-line
    switch (item.estado) {
      case "aceptado":
        return (
          <p
            className="text-info-solicitud"
            onClick={() => props.history.push(`/admin/solicitudes/${item._id}`)}
          >
            Ver solicitud aceptada
          </p>
        );
      case "pendiente":
        return (
          <button
            className="btn-verificar-solicitud"
            onClick={() => {
              props.history.push(`/admin/solicitudes/${item._id}`);
            }}
          >
            Verificar solicitud
          </button>
        );
      case "rechazado":
        return (
          <p
            className="text-info-solicitud"
            onClick={() => props.history.push(`/admin/solicitudes/${item._id}`)}
          >
            Ver solicitud rechazada
          </p>
        );
    }
  };

  return (
    <>
      <AdminNavbar cerrarSesion={cerrarSesion} />
      <main className="main-admin">
        <div className="header-solicitudes pendientes">
          <h1>Verificar Solicitudes</h1>
          <div className="form-group form-group-dropdown">
            <label htmlFor="dropdown">Filtrar por:</label>
            <Dropdown
              options={optionsDropdown}
              onChange={onDropdownChange}
              value={condicion}
              className="dropdown"
              placeholder="Filtrar por..."
              id="dropdown"
            />
          </div>
          <input
            className="searchbar"
            type="text"
            onChange={searchInData}
            placeholder="Busca un nombre o documento"
          />
          <div className="container-resultados-busqueda">
            {searchData.map((item) => (
              <div
                className="resultado-busqueda"
                onClick={() =>
                  props.history.push(`/admin/solicitudes/${item._id}`)
                }
                key={item._id}
              >
                <p>
                  {item.nombre} {item.apellidos}
                </p>
              </div>
            ))}
          </div>
          <p className="label-ordenar">Ordenar por: </p>
          <span
            className={`opcion-ordenar ${
              numeroOrdenarActual === 1 && "opcion-ordenar-active"
            } `}
            onClick={() => {
              ordenarArray(1);
              setNumeroOrdenarActual(1);
            }}
          >
            Más viejo
          </span>
          <span
            className={`opcion-ordenar ${
              numeroOrdenarActual === 2 && "opcion-ordenar-active"
            } `}
            onClick={() => {
              ordenarArray(2);
              setNumeroOrdenarActual(2);
            }}
          >
            Más nuevo
          </span>
          <span
            className={`opcion-ordenar ${
              numeroOrdenarActual === 3 && "opcion-ordenar-active"
            } `}
            onClick={() => {
              ordenarArray(3);
              setNumeroOrdenarActual(3);
            }}
          >
            Alfabético (A-Z)
          </span>
        </div>
        <div className="container-cards-admin">
          {loading ? (
            <h3 className="txt-cargando">Cargando...</h3>
          ) : data.length === 0 ? (
            <h1>No se encontraron usuarios en este estado</h1>
          ) : (
            data.map((item) => (
              <div className="card" key={item._id}>
                <h4 className="info-usuario">
                  {item.nombre} {item.apellidos}{" "}
                  <span className="numero-documento">
                    {item.numeroDocumento}
                  </span>
                </h4>
                {renderBtnEstado(item)}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
};

export default AdminSolicitudes;

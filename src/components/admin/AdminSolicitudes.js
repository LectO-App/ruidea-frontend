import React, { useState, useEffect } from "react";
import axios from "axios";

import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

import AdminAuth from "./adminAuth";

import AdminNavbar from "./AdminNavbar";

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

  const fetchFromAPI = async (condicion) => {
    setLoading(true);
    const res = await axios.post(
      "https://ruidea.herokuapp.com/admin/solicitudes",
      { condicion }
    );
    setData(res.data);
    setLoading(false);
    console.log(res.data);
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
    console.log(AdminAuth.isAuthenticated());
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
        sortedArray = [...data].sort((a, b) =>
          b.nombre > a.nombre ? 1 : a.nombre > b.nombre ? -1 : 0
        );
        break;
    }
    setData(sortedArray);
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
            <h1>Cargando...</h1>
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
                <button
                  className="btn-verificar-solicitud"
                  onClick={() => {
                    props.history.push(`/admin/solicitudes/${item._id}`);
                  }}
                >
                  Verificar solicitud
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
};

export default AdminSolicitudes;

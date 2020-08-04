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
    { value: "revision ", label: "Pendientes de revisión" },
    { value: "", label: "Todos" },
  ];
  const defaultOption = optionsDropdown[0];

  const [condicion, setCondicion] = useState(defaultOption.value);

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
      console.log("hola");
    });
  };

  const onDropdownChange = (e) => {
    setCondicion(e.value);
    fetchFromAPI(e.value);
  };

  return (
    <>
      <AdminNavbar cerrarSesion={cerrarSesion} />
      <main className="main-admin">
        <div className="header-solicitudes pendientes">
          <h1>Verificar Solicitudes</h1>
          <Dropdown
            options={optionsDropdown}
            onChange={onDropdownChange}
            value={condicion}
            className="dropdown"
          />
        </div>
        <div className="container-cards-admin">
          {loading ? (
            <h1>Cargando...</h1>
          ) : data.length === 0 ? (
            <h1>No se encontraron usuarios en este estado</h1>
          ) : (
            data.map((item) => (
              <div className="card" key={item.correoElectronico}>
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

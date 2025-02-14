import { useForm } from "react-hook-form";
import { createArticulo } from "../api/articulos.api";

export function VenderPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await createArticulo(data); // Envía los datos al backend
      console.log("Artículo creado:", res.data); // Respuesta del servidor
    } catch (error) {
      console.error(
        "Error al crear el artículo:",
        error.response?.data || error.message
      );
    }
  });

  return (
    <div>
      <h1>Registrar Artículo</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          {...register("title", { required: "El título es requerido" })}
          placeholder="Título"
        />
        {errors.title && <span>{errors.title.message}</span>}

        <textarea
          rows="3"
          placeholder="Descripción"
          {...register("description", {
            required: "La descripción es requerida",
          })}
        ></textarea>
        {errors.description && <span>{errors.description.message}</span>}

        <input
          type="text"
          {...register("institution", { required: false })}
          placeholder="Institución"
        />

        <input
          type="number"
          step="0.01"
          {...register("price", { required: "El precio es requerido" })}
          placeholder="Precio"
        />
        {errors.price && <span>{errors.price.message}</span>}

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

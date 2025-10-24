import { apislice } from "./api/Apislice";
import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

const getsliceadapter = createEntityAdapter({});
const initialState = getsliceadapter.getInitialState();

export const getslice = apislice.injectEndpoints({
  endpoints: ((builder) => ({
    getdata: builder.query({
      query: () => "/getdata",
      transformResponse: (responseData) => {
        const loadeddata = responseData.map((item) => {
          item.id = item._id;
          return item;
        });
        return getsliceadapter.setAll(initialState, loadeddata);
      },
      providesTags: (result) =>
        result?.ids
          ? [
              ...result.ids.map((id) => ({ type: "getdata", id })),
              { type: "getdata", id: "LIST" },
            ]
          : [{ type: "getdata", id: "LIST" }],
    }),

    RemoveAllCategories: builder.mutation({
      query: ({}) => ({
        method: "DELETE",
        url: "/Remove_all_categories",
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

    RemoveAllProduct: builder.mutation({
      query: ({}) => ({
        method: "DELETE",
        url: "/Remove_All_products",
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

    AUTH: builder.mutation({
      query: ({ username, password }) => ({
        method: "POST",
        url: "/Auth",
        body: { username, password },
      }),
    }),

    Add_categories: builder.mutation({
      query: ({ name }) => ({
        method: "POST",
        url: "/Add_categories",
        body: { name },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
    Send_otp: builder.mutation({
      query: ({ email ,Device}) => ({
        method: "POST",
        url: "/send_otp",
        body: { email,Device },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
    verify_otp: builder.mutation({
      query: ({ email,otp }) => ({
        method: "POST",
        url: "/verify-otp",
        body: { email,otp },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
    reset_password: builder.mutation({
      query: ({ newPassword,email }) => ({
        method: "POST",
        url: "/reset-password",
        body: { newPassword,email },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

      Reg: builder.mutation({
      query: ({ username,Email,Password }) => ({
        method: "POST",
        url: "/Reg",
        body: { username,email:Email,password:Password },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
      UpdateQuantity: builder.mutation({
      query: ({ quantity }) => ({
        method: "POST",
        url: "/Setting",
        body: { quantity },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

    GetProduct: builder.mutation({
      query: ({}) => ({
        method: "DELETE",
        url: "/Remove_All_products",
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

    removecategory: builder.mutation({
      query: ({ id }) => ({
        method: "DELETE",
        url: "/remove_categories",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "getdata", id: arg.id },
        { type: "getdata", id: "LIST" },
      ],
    }),
    RemoveProduct: builder.mutation({
      query: ({ id }) => ({
        method: "DELETE",
        url: "/RemoveProduct",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "getdata", id: arg.id },
        { type: "getdata", id: "LIST" },
      ],
    }),

    edit_profile: builder.mutation({
      query: ({ username, password, id, image }) => ({
        method: "PATCH",
        url: "/edit_profile",
        body:image,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "getdata", id: arg.id }],
    }),
    Resets: builder.mutation({
      query: ({ email, password  }) => ({
        method:"PATCH",
        url: "/Reset",
        body:{email, password},
      }),
      invalidatesTags:[{ type: "getdata", id: "LIST" }],
    }),

    Addproducts: builder.mutation({
      query: ({
        name,
        productUrlSlug,
        isFeatured,
        category,
        image,
        quantity,
        colors,
        retailPrice,
        description,
        fm,
      }) => ({
        method: "POST",
        url: "/Add_product",
        body: fm,
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

    EditProducts: builder.mutation({
      query: ({
        id,
        name,
        productUrlSlug,
        isFeatured,
        category,
        colors,
        retailPrice,
        description,
        removeImageIndex,
        fm
      }) => ({
        method: "PATCH",
        url: "/edit_product",
        body: fm
      }),
      invalidatesTags: (result, error, arg) => [{ type: "getdata", id: arg.id }],
    }),

    sellProducts: builder.mutation({
      query: ({
        name,
        isFeatured,
        category,
        image,
        quantity,
        colors,
        id,
        retailPrice,
        description,
      }) => ({
        method: "PATCH",
        url: "/Sell",
        body: {
          name,
          id,
          isFeatured,
          category,
          image,
          quantity,
          colors,
          retailPrice,
          description,
        },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

    GetProduct: builder.query({
      query: ({}) => "/Products",
      providesTags: [{ type: "getdata", id: "LIST" }],
    }),

    GetGetCategories: builder.query({
      query: ({}) => "/GetCategories",
      providesTags: [{ type: "getdata", id: "LIST" }],
    }),

    GetSoldProduct: builder.query({
      query: ({}) => "/GetSoldProduct",
      providesTags: [{ type: "getdata", id: "LIST" }],
    }),
    GetQuantity: builder.query({
      query: ({}) => "/GetQuantity",
      providesTags: [{ type: "getdata", id: "LIST" }],
    }),

    GetSells: builder.query({
      query: ({}) => "/GetSells",
      providesTags: [{ type: "getdata", id: "LIST" }],
    }),
    GetUser: builder.query({
      query: ({}) => "/GetUser",
      providesTags: [{ type: "getdata", id: "LIST" }],
    }),
  })),
});

export const {
  useGetSellsQuery,
  useRegMutation,
  useGetUserQuery,
  useGetSoldProductQuery,
  useAUTHMutation,
  useGetQuantityQuery,
  useAdd_categoriesMutation,
  useAddproductsMutation,
  useRemoveProductMutation,
  useEditProductsMutation,
  useEdit_profileMutation,
  useGetProductQuery,
  useResetsMutation,
  useGetdataQuery,
  useRemoveAllProductMutation,
  useSellProductsMutation,
  useRemoveAllCategoriesMutation,
  useLazyGetdataQuery,
  useRemovecategoryMutation,
  useReset_passwordMutation,
  useSend_otpMutation,
  useVerify_otpMutation,
  useUpdateQuantityMutation,
  useGetGetCategoriesQuery,
} = getslice;

const selectgetdataresult = getslice.endpoints.getdata.select();

export const selectgetdata = createSelector(
  selectgetdataresult,
  (getdataresult) => getdataresult.data
) ?? initialState;

export const {
  selectAll: selectAlldata,
  selectById: selectdataById,
  selectIds: selectdataIds,
} = getsliceadapter.getSelectors((state) => selectgetdata(state));

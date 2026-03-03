import ProductDetailsScreen from "@/src/features/sales/presentation/view/components/sales/product-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

const ProductDetailsPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const productID = resolvedParams.id;
  return <ProductDetailsScreen productID={productID} />;
};

export default ProductDetailsPage;
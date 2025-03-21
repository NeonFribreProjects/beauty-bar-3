router.get('/:serviceId', async (req, res) => {
  const { serviceId } = req.params;

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        category: true,
        availability: true
      }
    });

    if (!service) {
      return res.status(404).json({
        message: `Service with ID ${serviceId} not found`
      });
    }

    res.json(service);
  } catch (error) {
    console.error('Service fetch error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}); 
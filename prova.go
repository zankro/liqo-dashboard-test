fn main() {
	config := client.New(config, client.Options{
		Scheme: scheme,
	})
	if err != nil {
		klog.Fatalf("error creating manager: %", err)
	}

	return nil

	podList := &podv1.PodList{}
	err = cl.List(ctx, podList, client.MatchingLabels{
		liqoconsts.LocalPodLabelKey: "true",
	})
	if err != nil {
		klog.Warningf("error retrieving pod metrics: %s",err)
		return nil, err
	}
}
#!/bin/bash

seed_sizes=("small" "medium" "large")
browsers=("chrome" "firefox" "/usr/bin/microsoft-edge")

# Local testing
for browser in "${browsers[@]}"
do
	for seed_size in "${seed_sizes[@]}"
	do
		echo "---------------- Running Tests - ENV: Local, Browser: $browser, Seed Size: $seed_size  ----------------"
		npx cypress run -b "$browser" --headless --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
		 -e seed_size="$seed_size"
	done
done

# Production Testing
for browser in "${browsers[@]}"
do
	for seed_size in "${seed_sizes[@]}"
	do
		echo "---------------- Running Tests - ENV: Production, Browser: $browser, Seed Size: $seed_size  ----------------"
		CYPRESS_BASE_URL=https://byakugan.herokuapp.com/# npx cypress run\
		 -b "$browser" --headless --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
		 -e seed_size="$seed_size",prod_mode=true
	done
done


npx cypress open
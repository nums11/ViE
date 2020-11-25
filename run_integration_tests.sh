#!/bin/bash

seed_sizes=("small")

# Local testing
# for seed_size in "${seed_sizes[@]}"
# do
# 	echo "---------------- Running test locally with $seed_size seed_size ----------------"
# 	npx cypress run --spec "cypress/integration/Actions/meeting_creation_spec.js"\
# 	 -b chrome --headless --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
# 	 -e seed_size="$seed_size"
# done

# Production Testing
for seed_size in "${seed_sizes[@]}"
do
	echo "---------------- Running test in production with $seed_size seed_size ----------------"
	CYPRESS_BASE_URL=https://byakugan.herokuapp.com/# npx cypress run\
	 --spec "cypress/integration/Actions/meeting_creation_spec.js"\
	 -b chrome --headless --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
	 -e seed_size="$seed_size",prod_mode=true
done

npx cypress open

# Running all tests in production with different seed sizes
# CYPRESS_BASE_URL=https://byakugan.herokuapp.com/# npx cypress run\
#  -e seed_size=small,prod_mode=true
# CYPRESS_BASE_URL=https://byakugan.herokuapp.com/# npx cypress run\
#  -e seed_size=medium,prod_mode=true
# CYPRESS_BASE_URL=https://byakugan.herokuapp.com/# npx cypress run\
#  -e seed_size=large,prod_mode=true

# Varying browser locally and in prod
# Simply just changing the --browser flag
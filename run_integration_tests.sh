echo "---------------- Running test with small seed_size ----------------"
npx cypress run --spec "cypress/integration/Actions/meeting_creation_spec.js"\
 -b chrome --headless --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
 --group "small_seeds2" --ci-build-id local2 -e seed_size=small

echo "---------------- Running test with medium seed_size ----------------"
npx cypress run --spec "cypress/integration/Actions/meeting_creation_spec.js"\
 -b chrome --headless --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
 --group "small_seeds2" --ci-build-id local2 -e seed_size=medium

# Running all tests locally with different seed sizes
# Could probably convert into a for loop
# npx cypress run -e seed_size=small\
#  --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
# npx cypress run -e seed_size=medium\
#  --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
# npx cypress run -e seed_size=large\
#  --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\

# Running all tests in production with different seed sizes
# CYPRESS_BASE_URL=https://byakugan.herokuapp.com/# npx cypress run\
#  -e seed_size=small,prod_mode=true
# CYPRESS_BASE_URL=https://byakugan.herokuapp.com/# npx cypress run\
#  -e seed_size=medium,prod_mode=true
# CYPRESS_BASE_URL=https://byakugan.herokuapp.com/# npx cypress run\
#  -e seed_size=large,prod_mode=true

# Varying browser locally and in prod
# Simply just changing the --browser flag